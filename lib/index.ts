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
  appSlug: string;
  env: string;
  userId: string;
}

type RequestParams = {
  key?: string;
  results?: {};
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

function AngelListAppstoreApiClient({ apiKey, appSlug, env, userId }: ClientParams) {
  const baseUrl = env === 'production' ? 'https://angel.co/appstore/api' : 'https://angel.dev/appstore/api';

  const authenticate = async () => {
    const body = {
      api_key: apiKey,
      app_slug: appSlug,
      user_id: userId,
    };

    return makeRequest(`${baseUrl}/auth`, body);
  };

  const getUserData = async ({ key, token }: RequestParams) => {
    const body = {
      key,
      token,
    };

    return makeRequest(`${baseUrl}/get`, body);
  };

  const setUserData = async ({ key, token, value }: RequestParams) => {
    const body = {
      key,
      token,
      value,
    };

    return makeRequest(`${baseUrl}/set`, body);
  };

  const submit = async ({ results, token }: RequestParams) => {
    const body = {
      results,
      token,
    };

    return makeRequest(`${baseUrl}/submit`, body);
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
