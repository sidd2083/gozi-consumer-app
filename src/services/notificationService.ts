import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { OrderStatus } from '../types';

// Set global notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Gozi Notifications] Permission not granted');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    return tokenData?.data || null;
  } catch (e) {
    console.warn('[Gozi Notifications] Push registration error:', e);
    return null;
  }
}

/**
 * Trigger local notification on order status transition
 */
export async function triggerOrderStatusNotification(orderNumber: string, status: OrderStatus) {
  if (Platform.OS === 'web') return;

  const messages: Record<OrderStatus, { title: string; body: string }> = {
    placed: {
      title: 'Order Placed!',
      body: `Your Gozi order #${orderNumber} has been received by the store.`,
    },
    packing: {
      title: 'Packing Your Items',
      body: `Store team is carefully packing your fresh groceries.`,
    },
    handover: {
      title: 'Out for Delivery!',
      body: `Your rider is on the way with your order. Arriving in ~10 mins!`,
    },
    reached: {
      title: 'Rider Arrived!',
      body: `Your rider is at your gate. Please be ready with cash (COD).`,
    },
    delivered: {
      title: 'Delivered Successfully!',
      body: `Your order has been delivered. Enjoy fresh groceries from Gozi!`,
    },
    cancelled: {
      title: 'Order Cancelled',
      body: `Your order #${orderNumber} was cancelled.`,
    },
  };

  const notificationContent = messages[status];
  if (!notificationContent) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationContent.title,
        body: notificationContent.body,
        sound: true,
        data: { orderNumber, status },
      },
      trigger: null, // Send immediately
    });
  } catch (e) {
    console.warn('[Gozi Notifications] Failed to schedule notification:', e);
  }
}
