import { computed, reactive, readonly } from "vue";

const REQUEST_TIMEOUT_MS = 8_000;
const SYNC_DEBOUNCE_MS = 600;

interface LikeState {
  likes: number | null;
  serverLikes: number | null;
  pendingLikes: number;
  isLoading: boolean;
  isSyncing: boolean;
  errorMessage: string;
}

interface LikeRuntime {
  activeController: AbortController | null;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  loadPromise: Promise<void> | null;
  needsPostSyncFlush: boolean;
}

const likeStates = reactive<Record<string, LikeState>>({});
const likeRuntimes = new Map<number, LikeRuntime>();

function getStateKey(postId: number) {
  return String(postId);
}

function getLikeState(postId: number) {
  const key = getStateKey(postId);

  if (!likeStates[key]) {
    likeStates[key] = {
      likes: null,
      serverLikes: null,
      pendingLikes: 0,
      isLoading: false,
      isSyncing: false,
      errorMessage: "",
    };
  }

  return likeStates[key];
}

function getLikeRuntime(postId: number) {
  const runtime = likeRuntimes.get(postId);

  if (runtime) {
    return runtime;
  }

  const nextRuntime: LikeRuntime = {
    activeController: null,
    debounceTimer: null,
    loadPromise: null,
    needsPostSyncFlush: false,
  };

  likeRuntimes.set(postId, nextRuntime);
  return nextRuntime;
}

function getLikesEndpoint(postId: number) {
  return `/api/likes/${postId}`;
}

function syncVisibleLikes(state: LikeState) {
  state.likes = state.serverLikes == null
    ? null
    : state.serverLikes + state.pendingLikes;
}

function clearDebounce(runtime: LikeRuntime) {
  if (runtime.debounceTimer == null) {
    return;
  }

  globalThis.clearTimeout(runtime.debounceTimer);
  runtime.debounceTimer = null;
}

function getRequestErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The likes request timed out";
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

async function fetchLikesJson(
  postId: number,
  runtime: LikeRuntime,
  init?: RequestInit,
) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  runtime.activeController = controller;

  try {
    const response = await fetch(getLikesEndpoint(postId), {
      ...init,
      signal: controller.signal,
    });
    const data = await response.json() as Record<string, unknown>;

    return { response, data };
  } finally {
    globalThis.clearTimeout(timeoutId);

    if (runtime.activeController === controller) {
      runtime.activeController = null;
    }
  }
}

function scheduleFlush(postId: number, delay = SYNC_DEBOUNCE_MS) {
  const runtime = getLikeRuntime(postId);

  clearDebounce(runtime);
  runtime.debounceTimer = globalThis.setTimeout(() => {
    runtime.debounceTimer = null;
    void flushPendingLikes(postId);
  }, delay);
}

async function flushPendingLikes(postId: number) {
  const state = getLikeState(postId);
  const runtime = getLikeRuntime(postId);

  if (state.serverLikes == null || state.pendingLikes === 0) {
    return;
  }

  if (state.isSyncing) {
    runtime.needsPostSyncFlush = true;
    return;
  }

  const delta = state.pendingLikes;
  state.pendingLikes = 0;
  state.isSyncing = true;
  state.errorMessage = "";
  syncVisibleLikes(state);

  try {
    const { response, data } = await fetchLikesJson(postId, runtime, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ likes: delta }),
    });

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Could not save likes",
      );
    }

    state.serverLikes = Number(data.likes ?? 0);
    syncVisibleLikes(state);
  } catch (error) {
    state.pendingLikes += delta;
    syncVisibleLikes(state);
    state.errorMessage = getRequestErrorMessage(error, "Could not save likes");
  } finally {
    state.isSyncing = false;

    if (runtime.needsPostSyncFlush || state.pendingLikes > 0) {
      runtime.needsPostSyncFlush = false;
      scheduleFlush(postId);
    }
  }
}

async function ensureLoaded(postId: number) {
  const state = getLikeState(postId);
  const runtime = getLikeRuntime(postId);

  if (state.serverLikes != null) {
    return;
  }

  if (runtime.loadPromise) {
    return runtime.loadPromise;
  }

  state.isLoading = true;
  state.errorMessage = "";

  runtime.loadPromise = (async () => {
    try {
      const { response, data } = await fetchLikesJson(postId, runtime);

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not load likes",
        );
      }

      state.serverLikes = Number(data.likes ?? 0);
      syncVisibleLikes(state);
    } catch (error) {
      state.errorMessage = getRequestErrorMessage(error, "Could not load likes");
    } finally {
      state.isLoading = false;
      runtime.loadPromise = null;
    }
  })();

  return runtime.loadPromise;
}

function incrementLikes(postId: number) {
  const state = getLikeState(postId);

  if (state.isLoading || state.serverLikes == null) {
    return;
  }

  state.errorMessage = "";
  state.pendingLikes += 1;
  syncVisibleLikes(state);
  scheduleFlush(postId);
}

export function useLikesStore(postId: number) {
  const state = getLikeState(postId);

  return {
    state: readonly(state),
    buttonLabel: computed(() => {
      if (state.isLoading) {
        return "Loading likes...";
      }

      if (state.likes == null) {
        return "Like this post";
      }

      return `Like this post (${state.likes})`;
    }),
    isButtonDisabled: computed(() => state.isLoading || state.likes == null),
    syncMessage: computed(() => {
      if (state.errorMessage || state.isLoading) {
        return "";
      }

      if (state.pendingLikes > 0 || state.isSyncing) {
        return "Syncing likes...";
      }

      return "";
    }),
    ensureLoaded: () => ensureLoaded(postId),
    incrementLikes: () => incrementLikes(postId),
  };
}
