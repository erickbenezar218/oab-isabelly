import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const STUDY_REMINDER_ID = 9001

export async function syncStudyReminderNotification(enabled: boolean) {
  if (!Capacitor.isNativePlatform()) return

  await LocalNotifications.cancel({ notifications: [{ id: STUDY_REMINDER_ID }] })
  if (!enabled) return

  const perm = await LocalNotifications.requestPermissions()
  if (perm.display !== 'granted') return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: STUDY_REMINDER_ID,
        title: 'Hora de estudar!',
        body: 'Abra o SimulaOrdem e bata sua meta de hoje.',
        schedule: {
          on: { hour: 8, minute: 0 },
          every: 'day',
          allowWhileIdle: true,
        },
        sound: 'default',
        extra: { route: '/app/flashcards' },
      },
    ],
  })
}

export async function initNativeNotifications() {
  if (!Capacitor.isNativePlatform()) return

  try {
    await LocalNotifications.requestPermissions()
  } catch {
    /* ignore */
  }

  await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
    const route = (event.notification.extra as { route?: string })?.route ?? '/app'
    window.location.href = route
  })
}
