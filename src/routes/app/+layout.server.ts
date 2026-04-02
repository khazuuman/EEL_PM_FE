
export const load = async (event) => {
    const { locals } = event;
    return {
        user: locals.user,
        accessToken: locals.accessToken
    };
};
