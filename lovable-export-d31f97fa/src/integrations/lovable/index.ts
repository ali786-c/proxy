// MOCKED LOVABLE SDK
export const lovable: any = {
  auth: {
    signInWithOAuth: async () => {
      console.warn("OAuth not supported in this environment. Use standard login.");
      return { error: new Error("OAuth not supported") };
    },
  },
};
