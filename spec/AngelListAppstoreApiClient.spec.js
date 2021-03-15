import AngelListAppstoreApiClient from '../lib';
import fetch from 'cross-fetch';

jest.mock('cross-fetch');

const mockFetch = (responseJson = {}, status = 200) => () => {
  return {
    json: () => responseJson,
    status,
  }
};

describe('AngelListAppstoreApiClient', () => {
  const apiKey = '123xyz';
  const appSlug = 'my-app';
  const key = 'test-key';
  const token = 'abcdefg';
  const user = { first_name: 'Test', last_name: 'User' };
  const userId = 'test-user-id';
  const value = 'test-value';

  const apiClient = AngelListAppstoreApiClient({ apiKey, appSlug, userId });

  const itBehavesLikeRetryableRequest = (request) => {
    describe('when a new token can be generated', () => {
      beforeEach(() => {
        fetch
          .mockImplementationOnce(mockFetch({}, 401))
          .mockImplementationOnce(mockFetch({ token, user }))
          .mockImplementationOnce(mockFetch({ key, value }));
      });

      it('fetches a new token and retries the request', async () => {
        const response = await request();
        const responseJson = {
          authorization: {
            token,
            user,
          },
          key,
          value,
        }

        expect(response).toEqual(responseJson);
      });
    });

    describe('when a new token cannot be generated', () => {
      beforeEach(() => {
        fetch
          .mockImplementationOnce(mockFetch({}, 401))
          .mockImplementationOnce(mockFetch({}, 401));
      });

      it('throws an error', async () => {
        await expect(request()).rejects.toThrow('Bad response from server');
      });
    });
  }

  describe('authenticate', () => {
    describe('a successful request', () => {
      beforeEach(() => {
        fetch.mockImplementation(mockFetch({ token, user }));
      });

      it('returns a token and user data', async () => {
        const response = await apiClient.authenticate();
        expect(response).toEqual({ token, user })
      });
    });

    describe('an unsuccessful request', () => {
      beforeEach(() => {
        fetch.mockImplementation(mockFetch({}, 401));
      });

      it('throws an error', async () => {
        await expect(apiClient.authenticate()).rejects.toThrow('Bad response from server');
      });
    });
  });

  describe('getUserData', () => {
    describe('a successful request', () => {
      beforeEach(() => {
        fetch.mockImplementation(mockFetch({ key, value }));
      });

      it('returns a value from a given key on the user datastore', async () => {
        const response = await apiClient.getUserData({ token, key });
        expect(response).toEqual({ key, value });
      });
    });

    describe('an unsuccessful request', () => {
      const request = async () => await apiClient.getUserData({ token: 'bad-token', key });
      itBehavesLikeRetryableRequest(request);
    });
  });

  describe('setUserData', () => {
    describe('a successful request', () => {
      beforeEach(() => {
        fetch.mockImplementation(mockFetch({ key, value }));
      });

      it('sets a key-value pair on the datastore', async () => {
        const response = await apiClient.setUserData({ token, key, value });
        expect(response).toEqual({ key, value });
      });
    });

    describe('an unsuccessful request', () => {
      const request = async () => await apiClient.setUserData({ token: 'bad-token', key, value });
      itBehavesLikeRetryableRequest(request);
    });
  });

  describe('submit', () => {
    describe('a successful request', () => {
      beforeEach(() => {
        fetch.mockImplementation(mockFetch({ value }));
      });

      it('submits data to the datastore', async () => {
        const response = await apiClient.submit({ token, key, value });
        expect(response).toEqual({ value });
      });
    });

    describe('an unsuccessful request', () => {
      const request = async () => await apiClient.submit({ token: 'bad-token', key, value });
      itBehavesLikeRetryableRequest(request);
    });
  });
});
