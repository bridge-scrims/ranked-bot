export interface RequestOptions extends RequestInit {
    signal?: never
    headers?: Record<string, string>
    /** number in seconds */
    timeout?: number
}

export class RequestError extends Error {
    name = "RequestError"

    constructor(msg: string, cause?: Error) {
        super(msg, { cause })
    }
}

export class TimeoutError extends RequestError {
    name = "TimeoutError"
}

export class HTTPError extends RequestError {
    name = "HTTPError"
    public response: Response

    constructor(msg: string, response: Response) {
        super(msg)
        this.response = response
    }
}

export async function request(url: string, options: RequestOptions = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), (options.timeout || 10) * 1000)

    function requestError(error: Error): Response {
        if (controller.signal.aborted) throw new TimeoutError("Server took too long to respond")
        if (error instanceof TypeError) {
            error = error.cause as Error
        }
        throw new RequestError("Request Failed", error)
    }

    return fetch(url, { ...options, signal: controller.signal })
        .catch(requestError)
        .then((resp) => {
            clearTimeout(timeoutId)
            if (!resp.ok) {
                throw new HTTPError(`${resp.status} Response`, resp)
            }
            return resp
        })
}
