import ErrorPage from 'next/error'

function Error({ statusCode }) {
  if (statusCode) {
    return <ErrorPage statusCode={statusCode} />
  }
  return (
    <div>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'Opps. Terjadi sesuatu masalah.'}
      </p>
    </div>
  )
}

Error.getInitialProps = ({ err, res }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
