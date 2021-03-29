import fetch from 'cross-fetch';

type BodyType = {
  api_key?: string;
  key?: string;
  token?: string | null;
  user_id?: string;
  value? :string;
}

type ClientParams = {
  apiKey: string;
  apiUrl: string;
  appSlug: string;
  userId: string;
}

type RequestParams = {
  key?: string;
  results?: {};
  status?: string;
  token: string;
  value?: string;
}

type RequestType = (requestParams: RequestParams) => Promise<any>;

const makeRequest = async (
  url: string,
  body: BodyType,
  method = 'POST',
) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status >= 400) {
    throw new Error('Bad response from server');
  }

  return response.json();
};

function AngelListAppstoreApiClient({ apiKey, apiUrl, appSlug, userId }: ClientParams) {
  const authenticate = async () => {
    const body = {
      api_key: apiKey,
      app_slug: appSlug,
      user_id: userId,
    };

    return makeRequest(`${apiUrl}/auth`, body);
  };

  const getUserData = async ({ key, token }: RequestParams) => {
    const body = {
      key,
      token,
    };

    return makeRequest(`${apiUrl}/get`, body);
  };

  const setUserData = async ({ key, token, value }: RequestParams) => {
    const body = {
      key,
      token,
      value,
    };

    return makeRequest(`${apiUrl}/set`, body);
  };

  const submit = async ({ results, status, token }: RequestParams) => {
    const body = {
      results,
      status,
      token,
    };

    return makeRequest(`${apiUrl}/submit`, body);
  };

  const makeRetryableRequest = (request: RequestType) => async (params: RequestParams) => {
    let response;

    try {
      response = await request(params);
    } catch {
      const authorization = await authenticate();
      response = await request({ ...params, token: authorization.token });

      response = { ...response, authorization };
    }

    return response;
  }

  return {
    authenticate,
    getUserData: makeRetryableRequest(getUserData),
    setUserData: makeRetryableRequest(setUserData),
    submit: makeRetryableRequest(submit),
  };
}

export default AngelListAppstoreApiClient;
