import fetch from 'cross-fetch';

type AuthParams = {
  appSlug: string;
  userId: string;
}

type BodyType = {
  api_key?: string;
  key?: string;
  token?: string;
  user_id?: string;
  value? :string;
}

type GetUserDataParams = {
  key: string;
  token: string;
}

type SetUserDataParams = {
  key: string;
  token: string;
  value: string;
}

type SubmitParams = {
  token: string;
}

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

function AngelListAppstoreApiClient(apiKey) {
  const authorizeForUser = async ({ appSlug, userId }: AuthParams) => {
    const body = {
      api_key: apiKey,
      app_slug: appSlug,
      user_id: userId,
    };

    return makeRequest('auth', body);
  };

  const getUserData = async ({ key, token }: GetUserDataParams) => {
    const body = {
      key,
      token,
    };

    return makeRequest('get', body);
  };

  const setUserData = async ({ key, token, value }: SetUserDataParams) => {
    const body = {
      key,
      token,
      value,
    };

    return makeRequest('set', body);
  };

  const submit = async ({ token }: SubmitParams) => {
    return makeRequest('submit', { token });
  };

  return {
    authorizeForUser,
    getUserData,
    setUserData,
    submit,
  };
}

export default AngelListAppstoreApiClient;
