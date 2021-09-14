'use strict'

const process = require('process')
const opentelemetry = require('@opentelemetry/sdk-node')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http")
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino')
const { ConsoleSpanExporter, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const { Resource } = require('@opentelemetry/resources')
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')

const SERVICE_NAME = 'ecms-service'

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
})
const provider = new NodeTracerProvider({
  resource: resource,
})

const consoleExporter = new ConsoleSpanExporter()
const spanProcessor = new BatchSpanProcessor(consoleExporter)
provider.addSpanProcessor(spanProcessor)

const zipkinExporter = new ZipkinExporter({
  url: 'http://localhost:9411/api/v2/spans',
  serviceName: SERVICE_NAME,
})
const zipkinProcessor = new BatchSpanProcessor(zipkinExporter)
provider.addSpanProcessor(zipkinProcessor)

provider.register()

const sdk = new opentelemetry.NodeSDK({
  resource: resource,
  zipkinExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PinoInstrumentation({
      // Optional hook to insert additional context to log object.
      logHook: (span, record) => {
        record[SemanticResourceAttributes.SERVICE_NAME] = SERVICE_NAME
      },
    }),
  ],
})

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error))

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0))
})