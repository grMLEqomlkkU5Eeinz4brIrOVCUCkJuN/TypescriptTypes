// this feels weird but sure i guess
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
export type BcryptHash = string & { readonly __bcryptHash: unique symbol };
export const zBcryptHash = z.string().regex(BCRYPT_RE).transform(s => s as BcryptHash);

/* EXAMPLE

export class User {
	private passwordHash: BcryptHash | null = null;

  constructor() {
		this.passwordHash = passwordHash ? zBcryptHash.parse(passwordHash) : null;
  }
}

*/
