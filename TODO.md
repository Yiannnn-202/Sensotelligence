# Sensotelligence TODO

> Long-term direction: the platform will replace simulated radar frames with a real TI mmWave radar data stream, then run streaming deep-learning inference on that real signal to produce vital signs, signal quality, reports, alerts, and history.

## Confirmed target

- [ ] Replace the current `SimulatorAdapter`-only flow with real TI mmWave radar input.
- [ ] Parse hardware frames into the existing unified `RadarFrame` shape.
- [ ] Process radar frames as a stream, not as one-off batch uploads.
- [ ] Add a real deep-learning inference service for heart rate, respiration, blood pressure, PPG waveform, confidence, and signal quality.
- [ ] Keep the frontend connected through stable WebSocket/REST contracts so UI work does not need to be rewritten every time the backend internals change.

## Current status

- [x] Phase 1 frontend/backend API alignment is complete.
- [x] Current frontend can query backend REST status/session metadata.
- [x] Current frontend can continue using `WS /ws` for live simulated radar frames.
- [x] Backend and frontend services were stopped after validation; ports `8000` and `5173` are free.
- [ ] Phase 2 is the next backend milestone.

## Phase 1 - Stabilize the current backend contract - Done

Goal: make the current frontend fully supported by a clean backend API before adding hardware or models.

- [x] Keep `WS /ws` compatible with the current frontend.
- [x] Support client message `start_session` with flat fields: `hr_bpm`, `rr_bpm`, `noise_level`.
- [x] Support client message `stop_session`.
- [x] Send `status.started`, `status.stopped_ok`, and `error` messages consistently.
- [x] Keep sending legacy `frame` messages with `timestamp`, `frame_id`, `signal`, `range_profile`, and `ground_truth`.
- [x] Normalize `noise_level` so both `0.05` and `5` style values work.
- [x] Add session lifecycle metadata: `session_id`, `started_at`, `stopped_at`, `duration_s`, `frame_count`.
- [x] Add basic REST endpoints:
  - [x] `GET /api/status`
  - [x] `POST /api/session/start`
  - [x] `POST /api/session/stop`
  - [x] `GET /api/session/{session_id}`
- [x] Add frontend REST client for backend status and session detail.
- [x] Display API status, session ID, and backend session frame count in the monitoring page.
- [x] Fix frontend WebSocket reconnect cleanup to avoid duplicate idle connections.
- [x] Validate backend import/REST/WebSocket behavior and frontend production build.
- [x] Add formal automated backend tests for session start, stop, frame streaming, disconnect cleanup, and invalid input.

## Phase 2 - Add standard real-time event stream

Goal: stop treating `frame` as the only contract and introduce the future event model while preserving backward compatibility.

- [ ] Keep legacy `frame` events for the current frontend.
- [ ] Add `radar_frame` event for the future frontend contract.
- [ ] Add `device_status` event with connection state, source, FPS, dropped frames, and latency.
- [ ] Add `signal_quality` event with score, level, SNR, artifact score, and reason.
- [ ] Add `inference_status` event with model readiness, runtime, model version, and latency.
- [ ] Add `vital_signs` event with heart rate, respiration rate, blood pressure, confidence, and signal quality.
- [ ] Add `ppg_waveform` event with points, sampling rate, and window length.
- [ ] Add `session_summary` event when monitoring stops.
- [ ] Add `alert` event for low signal quality, device disconnect, model errors, and abnormal vitals.
- [ ] Document all event payloads in `Docs/API.md`.

## Phase 3 - Build mock inference pipeline

Goal: create the same backend shape that the real model will use, but start with deterministic/mock inference.

- [ ] Add `SignalPreprocessor` module for windowing, filtering, normalization, and quality features.
- [ ] Add `VitalInferenceService` as the only service the API layer calls for vital-sign inference.
- [ ] Add mock model implementation that outputs:
  - [ ] heart rate
  - [ ] respiration rate
  - [ ] blood pressure
  - [ ] PPG waveform
  - [ ] confidence
  - [ ] signal quality
- [ ] Maintain a sliding radar window per active session.
- [ ] Run inference at a controlled cadence instead of every raw frame if needed.
- [ ] Push inference outputs through `vital_signs`, `ppg_waveform`, `signal_quality`, and `inference_status`.
- [ ] Add tests that verify model service output shape does not depend on the simulator.

## Phase 4 - Add persistence, history, and reports

Goal: make `/results` and `/history` real backend-backed pages instead of static or local-only screens.

- [ ] Choose initial storage: SQLite for local prototype or PostgreSQL for deployment.
- [ ] Add database layer and migrations.
- [ ] Add tables/models for:
  - [ ] profile
  - [ ] monitoring session
  - [ ] radar frame summary
  - [ ] vital record
  - [ ] signal quality record
  - [ ] alert
  - [ ] report
- [ ] Persist session summaries and selected vital records.
- [ ] Add `GET /api/sessions` for history list.
- [ ] Add `GET /api/history/vitals` for trend charts.
- [ ] Add `POST /api/analysis/session/{session_id}` for report generation.
- [ ] Add `GET /api/reports/{report_id}` for report page data.
- [ ] Update the frontend to consume report/history APIs instead of hardcoded data.

## Phase 5 - Connect real TI mmWave radar hardware

Goal: replace simulated radar frames with real device data while keeping downstream code unchanged.

- [ ] Identify exact TI radar board model and communication mode.
- [ ] Document required ports, baud rates, firmware/config files, and startup sequence.
- [ ] Add `HardwareAdapter` base class or extend `RadarInterface` for hardware-specific lifecycle.
- [ ] Add `TiMmWaveAdapter`.
- [ ] Add serial/USB connection management.
- [ ] Add radar configuration command sender.
- [ ] Add raw byte stream reader.
- [ ] Add radar frame parser:
  - [ ] frame header detection
  - [ ] packet length validation
  - [ ] TLV parsing
  - [ ] checksum or integrity validation if available
  - [ ] dropped-frame tracking
- [ ] Convert parsed hardware packets into the shared `RadarFrame`.
- [ ] Add device health metrics: FPS, latency, dropped frames, reconnect state.
- [ ] Allow selecting data source: `simulator`, `ti_mmwave`, or later `file_replay`.
- [ ] Add a file-replay adapter if hardware access is intermittent.

## Phase 6 - Integrate real deep-learning model

Goal: replace mock inference with a real model without changing frontend contracts.

- [ ] Decide runtime: PyTorch, ONNX Runtime, or both.
- [ ] Define model input tensor shape and preprocessing requirements.
- [ ] Add model checkpoint directory and loading config.
- [ ] Add `ModelLoader`.
- [ ] Add real inference implementation behind `VitalInferenceService`.
- [ ] Add postprocessing for:
  - [ ] heart rate
  - [ ] respiration rate
  - [ ] blood pressure
  - [ ] PPG waveform
  - [ ] confidence
  - [ ] signal quality
- [ ] Add model warmup and readiness checks.
- [ ] Track inference latency and runtime errors.
- [ ] Add fallback behavior when model is not ready, without silently pretending real inference succeeded.
- [ ] Validate inference output against recorded radar samples.

## Phase 7 - Add health intelligence, alerts, and long-term management

Goal: turn raw monitoring output into user-facing health interpretation.

- [ ] Add rule-based alert engine for first version.
- [ ] Add abnormal-vital thresholds configurable by profile/context.
- [ ] Add low-quality-signal guidance messages.
- [ ] Generate session-level health summary after monitoring stops.
- [ ] Add LLM health-analysis service for report explanations and suggestions.
- [ ] Keep LLM analysis asynchronous and outside the per-frame real-time path.
- [ ] Store generated summaries and report text.
- [ ] Add exportable report format later if needed.
- [ ] Add trend analysis across multiple sessions.

## Phase 8 - Frontend/backend integration cleanup

Goal: make the polished frontend consume real backend data everywhere.

- [ ] Switch `useWebSocket` from legacy `frame`-only handling to the standard event stream.
- [ ] Display backend-provided `vital_signs` instead of frontend-derived heart/respiration values.
- [ ] Display backend-provided `signal_quality`, `confidence`, FPS, latency, and dropped frames.
- [ ] Display backend-provided `ppg_waveform`.
- [ ] Wire `/results` to `GET /api/reports/{report_id}`.
- [ ] Wire `/history` to `GET /api/sessions` and `GET /api/history/vitals`.
- [ ] Decide whether profile data remains local or moves to backend storage.
- [ ] Add user-facing error and reconnect states.

## Engineering rules

- [ ] Preserve the unified data boundary: every data source must output `RadarFrame`.
- [ ] Keep hardware parsing, signal preprocessing, model inference, API routing, and report generation separated.
- [ ] Do not put model logic directly in API route handlers.
- [ ] Do not put hardware-specific packet logic in the frontend.
- [ ] Keep WebSocket event payloads stable once the frontend starts consuming them.
- [ ] Keep simulation and replay modes available after hardware integration for demos and tests.
- [ ] Treat medical outputs as health observation only unless clinically validated.
