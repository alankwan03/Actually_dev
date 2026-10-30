import { CreateView, type CreateViewProps } from '../CreateView'

export type CreateEventModalProps = CreateViewProps

/**
 * CreateEventModal / CreatePlanFlow
 * Re-exports the unified CreateView component supporting additive circle presets,
 * guest chips with individual dismissal, and standalone guest lookup/creation.
 */
export function CreateEventModal(props: CreateEventModalProps) {
  return <CreateView {...props} />
}

export default CreateEventModal
