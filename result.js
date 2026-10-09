export const Ok = (value) => ({ ok: true, value });
export const Err = (error) => ({ ok: false, error });
export const Some = (value) => ({ some: true, value });
export const None = { some: false };
