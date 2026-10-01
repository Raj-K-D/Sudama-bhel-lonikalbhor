'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import TableOrderCard from '@/components/admin/TableOrderCard';
import Link from 'next/link';
import {
  requestNotificationPermission,
  notifyNewOrder,
  startPendingAlertLoop,
  stopPendingAlertLoop,
  isSoundMuted,
  setSoundMuted,
  playStaffAlertSound,
} from '@/lib/notify';
import { getRestaurantLocation, saveRestaurantLocation } from '@/lib/geofence';

export default function AdminPage() {
  const { placedOrders, updateOrderStatus, assistanceRequests, dismissAssistance, clearTableOrders } = useStore();
  const [muted, setMutedState] = useState(false);
  const [geoConfig, setGeoConfig] = useState<{ lat: number; lng: number; radiusMeters: number; enabled: boolean } | null>(null);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const handleClearAllTables = async () => {
    if (window.confirm('Are you sure you want to delete ALL orders across all tables? This is useful for clearing test orders.')) {
      for (const tableNum of activeTables) {
        await clearTableOrders(tableNum);
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    setMutedState(isSoundMuted());
    setGeoConfig(getRestaurantLocation());
  }, []);

  // Compute all pending orders
  const pendingOrdersList = Object.entries(placedOrders).flatMap(([tableStr, orders]) => {
    const tableNum = parseInt(tableStr, 10);
    return orders
      .filter((o) => o.status === 'pending')
      .map((o) => ({ tableNum, order: o }));
  });

  const hasPendingOrders = pendingOrdersList.length > 0;

  // Sound loop control: plays chime until owner clicks 'preparing'
  useEffect(() => {
    if (hasPendingOrders && !muted) {
      startPendingAlertLoop();
    } else {
      stopPendingAlertLoop();
    }

    return () => {
      stopPendingAlertLoop();
    };
  }, [hasPendingOrders, muted]);

  // Push notifications for new orders
  useEffect(() => {
    Object.entries(placedOrders).forEach(([tableStr, orders]) => {
      const tableNum = parseInt(tableStr, 10);
      orders
        .filter((o) => o.status === 'pending')
        .forEach((order) => {
          const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
          notifyNewOrder(tableNum, totalItems);
        });
    });
  }, [placedOrders]);

  // Audio chime when assistance request arrives
  useEffect(() => {
    if (assistanceRequests.length > 0 && !muted) {
      playStaffAlertSound();
    }
  }, [assistanceRequests.length, muted]);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setSoundMuted(next);
  };

  const handleMarkAllPreparing = () => {
    pendingOrdersList.forEach(({ tableNum, order }) => {
      updateOrderStatus(tableNum, order.id, 'preparing');
    });
    stopPendingAlertLoop();
  };

  const handleCalibrateLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveRestaurantLocation(pos.coords.latitude, pos.coords.longitude, 200, true);
        setGeoConfig(getRestaurantLocation());
        setGeoNotice(`✅ Shop location calibrated! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setTimeout(() => setGeoNotice(null), 4000);
      },
      () => {
        alert('Could not retrieve GPS location. Please allow location access in your browser.');
      },
      { enableHighAccuracy: true },
    );
  };

  const toggleGeofence = () => {
    if (!geoConfig) return;
    const nextEnabled = !geoConfig.enabled;
    saveRestaurantLocation(geoConfig.lat, geoConfig.lng, geoConfig.radiusMeters, nextEnabled);
    setGeoConfig(getRestaurantLocation());
  };

  const activeTables = Object.entries(placedOrders)
    .filter(([, orders]) => orders.length > 0)
    .map(([tableStr]) => parseInt(tableStr, 10))
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4 p-4 sm:p-5">
      {/* ── Pending Orders Audio Alert Banner ─────────────────────────────────── */}
      {hasPendingOrders && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-3 text-white shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🛎️</span>
            <div>
              <p className="font-georgia text-sm font-black text-primary">
                {pendingOrdersList.length} PENDING ORDER{pendingOrdersList.length > 1 ? 'S' : ''} WAITING!
              </p>
              <p className="text-xs text-white/70">
                {muted
                  ? 'Audio chime is currently muted.'
                  : 'Chime is ringing until you click "Preparing".'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                muted ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary border border-primary/50'
              }`}
            >
              {muted ? '🔇 Unmute Chime' : '🔊 Mute Sound'}
            </button>
            <button
              onClick={handleMarkAllPreparing}
              className="rounded-xl bg-primary px-4 py-1.5 font-georgia text-xs font-black text-white hover:bg-primary/90 transition-colors"
            >
              👨‍🍳 Mark All as Preparing
            </button>
          </div>
        </div>
      )}

      {/* ── Table Assistance Alert Banners (Water / Call Waiter) ──────────────── */}
      {assistanceRequests.length > 0 && (
        <div className="space-y-2">
          {assistanceRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-2xl border border-accent-gold/40 bg-accent-gold/10 px-4 py-2.5 text-white shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <span className="font-georgia font-black text-accent-gold">
                    Table {req.tableNumber}:
                  </span>{' '}
                  <span className="text-xs font-bold text-white">{req.requestType}</span>
                </div>
              </div>
              <button
                onClick={() => dismissAssistance(req.id)}
                className="rounded-xl bg-accent-gold px-3 py-1 text-xs font-black text-black hover:bg-accent-gold/80 transition-colors"
              >
                ✓ Attended
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Anti-Spoofing Geofence Control Bar ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white/80">
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>
            Anti-Fake Orders Geofence:{' '}
            <strong className={geoConfig?.enabled ? 'text-accent-green' : 'text-gray-400'}>
              {geoConfig?.enabled ? 'Active (Loni Kalbhor 500m radius)' : 'Disabled (Testing / Demo Mode)'}
            </strong>
          </span>
          {geoNotice && <span className="text-accent-gold font-bold">{geoNotice}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCalibrateLocation}
            title="Set restaurant GPS coordinates to current phone/tablet location"
            className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white transition-colors"
          >
            🎯 Calibrate Shop GPS Pin
          </button>
          <button
            onClick={toggleGeofence}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              geoConfig?.enabled ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
            }`}
          >
            {geoConfig?.enabled ? 'Pause Geofence' : 'Enable Geofence'}
          </button>
        </div>
      </div>

      {/* ── Active Tables Grid ────────────────────────────────────────────────── */}
      {activeTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center px-5">
          <span className="text-7xl opacity-30">🛎️</span>
          <p className="mt-5 font-georgia text-xl font-bold text-white">No active orders right now.</p>
          <p className="mt-2 text-sm text-white/50">Scan a table QR → Add items → Place Order.</p>
          <Link
            href="/admin/qr"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-georgia font-black text-white shadow-premium hover:bg-primary/90 transition-colors"
          >
            📱 View Table QR Codes
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-white/60">
              {activeTables.length} ACTIVE TABLE{activeTables.length > 1 ? 'S' : ''}
            </p>
            <button
              onClick={handleClearAllTables}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <span>🧹</span>
              <span>Clear All Test Orders</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeTables.map((tableNum) => (
              <TableOrderCard
                key={tableNum}
                tableNum={tableNum}
                orders={placedOrders[tableNum] ?? []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
