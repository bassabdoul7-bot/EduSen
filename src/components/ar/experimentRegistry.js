// Experiment registry - maps experiment IDs to their components
import AcidBaseExperiment from './experiments/AcidBaseExperiment'
import PrecipitationExperiment from './experiments/PrecipitationExperiment'
import ElectrolysisExperiment from './experiments/ElectrolysisExperiment'
import CircuitExperiment from './experiments/CircuitExperiment'
import CombustionExperiment from './experiments/CombustionExperiment'
import OpticsLensExperiment from './experiments/OpticsLensExperiment'
import FreeFallExperiment from './experiments/FreeFallExperiment'
import PendulumExperiment from './experiments/PendulumExperiment'
import ParallelCircuitExperiment from './experiments/ParallelCircuitExperiment'
import CellObservationExperiment from './experiments/CellObservationExperiment'
import PhotosynthesisExperiment from './experiments/PhotosynthesisExperiment'

export const experimentRegistry = {
  'acid-base': AcidBaseExperiment,
  'precipitation': PrecipitationExperiment,
  'electrolysis': ElectrolysisExperiment,
  'simple-circuit': CircuitExperiment,
  'combustion': CombustionExperiment,
  'optics-lens': OpticsLensExperiment,
  'free-fall': FreeFallExperiment,
  'pendulum': PendulumExperiment,
  'parallel-circuit': ParallelCircuitExperiment,
  'cell-observation': CellObservationExperiment,
  'photosynthesis': PhotosynthesisExperiment
}
