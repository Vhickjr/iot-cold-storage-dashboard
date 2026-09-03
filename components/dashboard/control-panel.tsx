'use client'

import { useEffect, useState } from 'react'
import { Loader2, Power, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDeviceControl } from '@/hooks/use-device-control'

export default function ControlPanel() {
  const { state, loading, error, pending, updateState, emergencyStop } = useDeviceControl()
  const [setpointDraft, setSetpointDraft] = useState(4)

  useEffect(() => {
    if (state) setSetpointDraft(state.temperatureSetpoint)
  }, [state?.temperatureSetpoint])

  const isAutomatic = state?.controlMode === 'automatic'
  const manualDisabled = loading || pending || isAutomatic

  if (loading && !state) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading device control state…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* System Power Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Power</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-semibold">Main Power Switch</p>
              <p className="text-sm text-muted-foreground">
                Current: {state?.systemOn ? 'ON' : 'OFF'}
              </p>
            </div>
            <Button
              onClick={() => updateState({ systemOn: !state?.systemOn })}
              disabled={manualDisabled}
              className={`${
                state?.systemOn
                  ? 'bg-success text-success-foreground hover:bg-success/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/90'
              }`}
            >
              <Power className="w-4 h-4 mr-2" />
              {state?.systemOn ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Temperature Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Temperature Setpoint</h3>
        <div className="space-y-4">
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground font-semibold">Target Temperature</span>
              <span className="text-2xl font-bold text-primary">{setpointDraft.toFixed(1)}°C</span>
            </div>
            <Slider
              value={[setpointDraft]}
              onValueChange={(value) => setSetpointDraft(value[0])}
              onValueCommit={(value) => updateState({ temperatureSetpoint: value[0] })}
              min={0}
              max={10}
              step={0.5}
              disabled={manualDisabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0°C</span>
              <span>10°C</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Optimal range: 2°C - 6°C
          </p>
        </div>
      </div>

      {/* Compressor Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cooling System</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-semibold">Compressor Status</p>
              <p className="text-sm text-muted-foreground">
                {state?.compressorOn ? 'Running' : 'Stopped'}
              </p>
            </div>
            <Button
              onClick={() => updateState({ compressorOn: !state?.compressorOn })}
              disabled={manualDisabled}
              className={`${
                state?.compressorOn
                  ? 'bg-info text-info-foreground hover:bg-info/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/90'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {state?.compressorOn ? 'Running' : 'Stopped'}
            </Button>
          </div>
        </div>
      </div>

      {/* Control Mode */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Control Mode</h3>
        <div className="space-y-3">
          {(['automatic', 'manual'] as const).map((mode) => (
            <label
              key={mode}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                state?.controlMode === mode
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } ${pending ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="radio"
                name="controlMode"
                value={mode}
                checked={state?.controlMode === mode}
                onChange={() => updateState({ controlMode: mode })}
                disabled={pending}
                className="mr-3"
              />
              <div>
                <p className="text-foreground font-semibold capitalize">{mode} Control</p>
                <p className="text-xs text-muted-foreground">
                  {mode === 'automatic'
                    ? 'System automatically maintains temperature — manual controls above are disabled'
                    : 'Manual control of power, compressor, and setpoint'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Emergency Shutdown */}
      <div className="bg-card border border-error rounded-lg p-6">
        <h3 className="text-lg font-semibold text-error mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Emergency Shutdown
        </h3>
        <p className="text-sm text-foreground mb-4">
          Immediately powers off the system. This action cannot be undone without manual restart.
        </p>
        {state?.lastEmergencyStopAt && (
          <p className="text-xs text-muted-foreground mb-4">
            Last triggered: {new Date(state.lastEmergencyStopAt).toLocaleString()}
          </p>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={pending} className="w-full bg-error text-error-foreground hover:bg-error/90">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Trigger emergency stop?</AlertDialogTitle>
              <AlertDialogDescription>
                This immediately powers off the cold storage system. Product inside will no longer
                be actively cooled until you restart it manually from this panel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => emergencyStop()}
                className="bg-error text-error-foreground hover:bg-error/90"
              >
                Confirm Emergency Stop
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
