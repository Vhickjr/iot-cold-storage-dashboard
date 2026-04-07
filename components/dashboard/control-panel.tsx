'use client'

import { useState } from 'react'
import { Power, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export default function ControlPanel() {
  const [systemOn, setSystemOn] = useState(true)
  const [compressorOn, setCompressorOn] = useState(true)
  const [temperatureSetpoint, setTemperatureSetpoint] = useState(4)
  const [controlMode, setControlMode] = useState<'automatic' | 'manual'>('automatic')

  return (
    <div className="space-y-6">
      {/* System Power Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Power</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-semibold">Main Power Switch</p>
              <p className="text-sm text-muted-foreground">
                Current: {systemOn ? 'ON' : 'OFF'}
              </p>
            </div>
            <Button
              onClick={() => setSystemOn(!systemOn)}
              className={`${
                systemOn
                  ? 'bg-success text-success-foreground hover:bg-success/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/90'
              }`}
            >
              <Power className="w-4 h-4 mr-2" />
              {systemOn ? 'ON' : 'OFF'}
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
              <span className="text-2xl font-bold text-primary">{temperatureSetpoint.toFixed(1)}°C</span>
            </div>
            <Slider
              value={[temperatureSetpoint]}
              onValueChange={(value) => setTemperatureSetpoint(value[0])}
              min={0}
              max={10}
              step={0.5}
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
                {compressorOn ? 'Running' : 'Stopped'}
              </p>
            </div>
            <Button
              onClick={() => setCompressorOn(!compressorOn)}
              className={`${
                compressorOn
                  ? 'bg-info text-info-foreground hover:bg-info/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/90'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {compressorOn ? 'Running' : 'Stopped'}
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
                controlMode === mode
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="controlMode"
                value={mode}
                checked={controlMode === mode}
                onChange={() => setControlMode(mode)}
                className="mr-3"
              />
              <div>
                <p className="text-foreground font-semibold capitalize">{mode} Control</p>
                <p className="text-xs text-muted-foreground">
                  {mode === 'automatic'
                    ? 'System automatically maintains temperature'
                    : 'Manual control of all parameters'}
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
          Immediately stops all operations. This action cannot be undone without manual restart.
        </p>
        <Button className="w-full bg-error text-error-foreground hover:bg-error/90">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergency Stop
        </Button>
      </div>
    </div>
  )
}
