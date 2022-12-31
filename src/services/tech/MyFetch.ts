
export class MyFetch {

    API_URL = process.env.REACT_APP_API_URL_ROOT

    async post<T>(path: string, data: Object): Promise<T> {

        const response = await fetch(
            this.API_URL + path,
            {
                method: 'POST',
                mode: "cors",
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify(data)
            }
        )
        return response.json() as T

    }

    async get<T>(path: string, data: Object): Promise<T> {
        const response = await fetch(
            this.API_URL + path,
            {
                method: 'GET',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                credentials: "include"
            }
        )
        return response.json() as T

    }

}
