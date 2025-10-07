const PERSIST_KEY = "app:state";

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

type Serializable = Record<string, unknown>;

type DateSerialized = {
  __type: "Date";
  value: string;
};

const replacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Date) {
    return { __type: "Date", value: value.toISOString() } satisfies DateSerialized;
  }
  return value;
};

const reviver = (_key: string, value: unknown): unknown => {
  if (value && typeof value === "object" && (value as DateSerialized).__type === "Date") {
    const { value: iso } = value as DateSerialized;
    return iso ? new Date(iso) : value;
  }
  return value;
};

export const loadPersistedState = <TState = unknown>(): TState | undefined => {
  if (!isBrowser) return undefined;
  try {
    const serializedState = localStorage.getItem(PERSIST_KEY);
    if (!serializedState) return undefined;
    return JSON.parse(serializedState, reviver) as TState;
  } catch (error) {
    console.warn("Failed to load persisted state", error);
    return undefined;
  }
};

export const savePersistedState = (state: unknown) => {
  if (!isBrowser) return;
  try {
    const serializedState = JSON.stringify(state as Serializable, replacer);
    localStorage.setItem(PERSIST_KEY, serializedState);
  } catch (error) {
    console.warn("Failed to persist state", error);
  }
};

export const clearPersistedState = () => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch (error) {
    console.warn("Failed to clear persisted state", error);
  }
};

export { PERSIST_KEY };
