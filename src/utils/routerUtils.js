export const getRouterBasename = () => {
  const path = window.location.pathname;

  // Check for /preview/ pattern first
  if (path.startsWith('/preview/') || path === '/preview') {
    return '/preview';
  }

  // Fallback to original pattern for /app/[something]/preview (may not be needed after switching to /preview/)
  const match = path.match(/^(\/app\/[^\/]+\/preview)/);
  return match ? match[1] : '';

};