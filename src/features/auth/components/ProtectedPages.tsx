import { HomePage } from '../../../routes/HomePage'
import { InsightsPage } from '../../../routes/InsightsPage'
import { SettingsPage } from '../../../routes/SettingsPage'
import { SoundsPage } from '../../../routes/SoundsPage'
import { ProtectedRoute, ProtectedUserRoute } from './ProtectedRoute'

export function FocusRoute() {
  return (
    <ProtectedUserRoute>
      {(storageOwnerId) => <HomePage storageOwnerId={storageOwnerId} />}
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
      {(storageOwnerId) => <InsightsPage storageOwnerId={storageOwnerId} />}
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
