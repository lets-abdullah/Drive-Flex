import { router, type Href } from 'expo-router';

/**
 * Safely navigates back if there is a previous screen in the navigation stack.
 * Otherwise, replaces the current route with the fallback route (defaults to Home tab)
 * so Expo Router never throws "The action 'GO_BACK' was not handled by any navigator."
 */
export function safeGoBack(fallback: Href = '/(tabs)') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
