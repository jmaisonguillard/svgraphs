const useEventBus = {
  on(ev: any, callback: () => void) {
    document.addEventListener(ev, callback);
  },

  dispatch(ev: any, data?: any) {
    document.dispatchEvent(new CustomEvent(ev, data || {}));
  },

  remove(ev: any, callback: () => void) {
    document.removeEventListener(ev, callback);
  },
};

export default useEventBus;
