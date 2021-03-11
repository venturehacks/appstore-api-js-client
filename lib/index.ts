import fetch from 'cross-fetch';

type BodyType = {
  api_key?: string;
  key?: string;
  token?: string | null;
  user_id?: string;
  value? :string;
}

type RequestParams = {
  key?: string;
  token: string;
  value?: string;
}

type RequestType = (requestParams: RequestParams) => Promise<any>;

const makeRequest = async (
  path: string,
  body: BodyType,
  method = 'POST',
) => {
  const url = `https://angel.dev/appstore/api/${path}`;
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

function AngelListAppstoreApiClient({ apiKey, appSlug, userId }: { apiKey: string, appSlug: string, userId: string }) {
  const authorization = { token: null, user: {} };

  const authorizeForUser = async () => {
    const body = {
      api_key: apiKey,
      app_slug: appSlug,
      user_id: userId,
    };

    const { token, user } = await makeRequest('auth', body);
    authorization.token = token;
    authorization.user = user;

    return authorization;
  };

  const getUserData = async ({ key, token }: RequestParams) => {
    const body = {
      key,
      token,
    };

    return makeRequest('get', body);
  };

  const setUserData = async ({ key, token, value }: RequestParams) => {
    const body = {
      key,
      token,
      value,
    };

    return makeRequest('set', body);
  };

  const submit = async ({ token }: RequestParams) => {
    return makeRequest('submit', { token });
  };

  const retryableRequest = (request: RequestType) => async (requestParams: RequestParams) => {
    let response;
    let token = authorization.token;

    if (!token) {
      ({ token } = await authorizeForUser());
    }

    if (token) {
      const params = { ...requestParams, token };

      try {
        response = request(params);
      } catch {
        await authorizeForUser();
        response = request(params);
      }

      return response;
    }
  }

  return {
    authorizeForUser,
    getUserData: retryableRequest(getUserData),
    setUserData: retryableRequest(setUserData),
    submit: retryableRequest(submit),
  };
}

export default AngelListAppstoreApiClient;
