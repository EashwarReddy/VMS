// app/not-found.tsx (for App Router) or pages/404.tsx (for Pages Router)
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.message}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved, deleted, or never existed.
        </p>
        <div style={styles.actions}>
          <Link href="/" style={styles.primaryButton}>
            Go Home
          </Link>
          <button onClick={() => window.history.back()} style={styles.secondaryButton}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
  },
  errorCode: {
    fontSize: '120px',
    fontWeight: 'bold',
    margin: '0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    margin: '20px 0',
    color: '#1f2937',
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#667eea',
    padding: '12px 30px',
    borderRadius: '8px',
    border: '2px solid #667eea',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};