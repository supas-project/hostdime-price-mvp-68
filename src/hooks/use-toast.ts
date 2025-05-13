
import * as React from "react"
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastT & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// This interface matches Sonner's toast API more closely
interface ToastProps extends Omit<ExternalToast, 'id'> {
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success"
}

function toast(props: string | ToastProps) {
  // Handle both formats: toast("Message") and toast({ title: "Title", ... })
  if (typeof props === "string") {
    return sonnerToast(props);
  }
  
  const { description, variant, ...rest } = props as ToastProps;
  
  // Map variants to Sonner's styling
  let className = "";
  if (variant === "destructive") {
    className = "destructive-toast";
  } else if (variant === "success") {
    className = "success-toast";
  }
  
  // Sonner expects the message as first arg and options as second arg
  // If no explicit message is provided, use description as the main message
  if (description) {
    return sonnerToast(description as string, {
      ...rest,
      className
    });
  }
  
  // For backward compatibility, if no description, use an empty string
  return sonnerToast("", {
    ...rest,
    className
  });
}

// Extend toast with variant helpers for convenience
toast.error = (message: string, options: Omit<ToastProps, "variant"| "description"> = {}) => {
  return sonnerToast.error(message, options);
};

toast.success = (message: string, options: Omit<ToastProps, "variant"| "description"> = {}) => {
  return sonnerToast.success(message, options);
};

toast.info = (message: string, options: Omit<ToastProps, "variant"| "description"> = {}) => {
  return sonnerToast(message, options);
};

toast.warning = (message: string, options: Omit<ToastProps, "variant"| "description"> = {}) => {
  return sonnerToast.warning(message, options);
};

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast }
