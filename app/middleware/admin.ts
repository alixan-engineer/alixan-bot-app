export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUser();
  await userStore.getUserByToken();
  if (userStore.user?.role !== 'admin') {
    return navigateTo(useLocalePath()('/'));
  }
});
