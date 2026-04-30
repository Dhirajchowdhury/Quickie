/**
 * Component registry — maps ui.type strings to React components.
 *
 * To add a new UI component:
 *   1. Create the component
 *   2. Import it here
 *   3. Add an entry to REGISTRY
 *
 * The system will automatically pick it up — no other files need changing.
 */

import EntityApp from '../components/EntityApp';
import DynamicForm from '../components/DynamicForm';
import RecordTable from '../components/RecordTable';

/**
 * Fallback shown when ui.type is unknown or unregistered.
 * Never crashes — always renders something visible.
 */
function UnknownComponent({ type }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-8 py-6 max-w-sm text-center">
        <p className="text-sm font-semibold text-amber-700">
          Unsupported component:{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">
            {String(type ?? 'unknown')}
          </code>
        </p>
        <p className="text-xs text-amber-600 mt-2">
          Add this type to <code>registry.jsx</code> to enable it.
        </p>
      </div>
    </div>
  );
}

// ── Registry map ──────────────────────────────────────────────────────────

const REGISTRY = {
  entity: EntityApp,
  form:   DynamicForm,
  table:  RecordTable,
  // Add new types here:
  // dashboard: DashboardComponent,
  // chart:     ChartComponent,
};

/**
 * Resolve a component by type string.
 * Always returns a renderable component — never null.
 */
export function resolveComponent(type) {
  if (typeof type === 'string' && REGISTRY[type]) {
    return REGISTRY[type];
  }
  return () => <UnknownComponent type={type} />;
}

/**
 * Check if a type is registered.
 */
export function isRegistered(type) {
  return typeof type === 'string' && type in REGISTRY;
}

export default REGISTRY;
