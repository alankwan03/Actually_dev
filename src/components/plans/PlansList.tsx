import { PlansView, type PlansViewProps } from '../PlansView'

export type PlansListProps = PlansViewProps

/**
 * PlansList / PlansTab / InTheWorks
 * Displays the host's active catch-ups and handles drilling down into PlanDetailView.
 */
export function PlansList(props: PlansListProps) {
  return <PlansView {...props} />
}

export default PlansList
