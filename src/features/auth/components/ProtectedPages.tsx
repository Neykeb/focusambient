import { HomePage } from '../../../routes/HomePage'
import { InsightsPage } from '../../../routes/InsightsPage'
import { SettingsPage } from '../../../routes/SettingsPage'
import { SoundsPage } from '../../../routes/SoundsPage'
import { ProtectedRoute, ProtectedUserRoute } from './ProtectedRoute'

export function FocusRoute() {
  return (
    <ProtectedUserRoute>
      {(storageOwnerId, getToken) => (
        <HomePage storageOwnerId={storageOwnerId} getToken={getToken} />
      )}
    </ProtectedUserRoute>
  )
}

export function SoundsRoute() {
  return (
    <ProtectedRoute>
      <SoundsPage />
    </ProtectedRoute>
  )
}

export function InsightsRoute() {
  return (
    <ProtectedUserRoute>
      {(storageOwnerId, getToken) => (
        <InsightsPage storageOwnerId={storageOwnerId} getToken={getToken} />
      )}
    </ProtectedUserRoute>
  )
}

export function SettingsRoute() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  )
}
