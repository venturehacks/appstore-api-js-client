import fetch from 'cross-fetch';

type BodyType = {
  api_key?: string;
  key?: string;
  token?: string | null;
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

function AngelListAppstoreApiClient({ apiKey, appSlug, userId }: { apiKey: string, appSlug: string, userId: string }) {
  const authorization = { token: null, user: {} };

  const authorizeForUser = async () => {
    const body = {
      api_key: apiKey,
      app_slug: appSlug,
      user_id: userId,
    };

    const { token } = await makeRequest('auth', body);
    authorization.token = token;
  };

  const getUserData = async ({ key }: GetUserDataParams) => {
    await authorizeForUser();

    const body = {
      key,
      token: authorization.token,
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
