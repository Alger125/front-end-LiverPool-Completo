/** Validation tools are opt-in and never part of the normal business interface. */
export const SHOW_DEMO_CONTROLS =
  import.meta.env.MODE === 'test' || import.meta.env.VITE_SHOW_DEMO_CONTROLS === 'true';
