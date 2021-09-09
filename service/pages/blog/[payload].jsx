import opentelemetry from '@opentelemetry/api'
import { renderStaticPage } from '../../utils/static-page-helpers';

const tracer = opentelemetry.trace.getTracer('service')

export default function Home() {
  const content = tracer.startActiveSpan('homePageSpan', span => {
    const content = renderStaticPage({
      ctx: { tracer }
    });

    span.end()
    return content
  })

  return content
}

export async function getStaticProps(context) {
  const getStaticPropsSpan = tracer.startSpan('getStaticProps')
  getStaticPropsSpan.end()

  return {
    props: {}
  }
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  } 
}