export type RDInstanceToken = {
    access_token: string
    expires_in: number
    refresh_token: string
}

export class RDToken {
    static _instance: RDInstanceToken
    static _generatedAt: number = 0

    static async _get_token(): Promise<RDInstanceToken> {
        const data = await fetch('https://api.rd.services/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.RD_CLIENT_ID as string,
                client_secret: process.env.RD_CLIENT_SECRET as string,
                refresh_token: process.env.RD_REFRESH_TOKEN as string,
            }),
        }).then(res => res.json())

        this._generatedAt = Math.floor(Date.now() + data?.expires_in)
        return data
    }

    static async singleton() {
        if (this._instance) {
            const currentTimestamp = Math.floor(Date.now() / 1000)
            if (currentTimestamp > this._generatedAt) {
                this._instance = await this._get_token()
                return this._instance
            }
            return this._instance
        }
        this._instance = await this._get_token()
        return this._instance
    }
}
