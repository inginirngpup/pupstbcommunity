import './App.css'

function App() {

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    action: 'register' | 'login'
  ) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const username = form.get('username');
    const password = form.get('password');

    if (action === 'register') {

      const studentNumber = form.get('student_number');

      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            student_number: studentNumber,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.error);
        return;
      }

      console.log('Registered:', data);

    } else if (action === 'login') {

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.error);
        return;
      }

      localStorage.setItem('token', data.token);

      console.log('Logged in!');
    }
  }

  return (
    <>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <form onSubmit={(event) =>
          handleSubmit(event, 'register')
        }>
          <input style={{ padding: '8px', margin: '8px' }}
            type="text" placeholder="Username" name="username" />

          <input style={{ padding: '8px', margin: '8px' }}
            type="text" placeholder="Student Number" name="student_number" />

          <input style={{ padding: '8px', margin: '8px' }}
            type="password" placeholder="Password" name="password" />

          <button type="submit" name="register">Register</button>
        </form>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <form onSubmit={(event) =>
          handleSubmit(event, 'login')
        }>
          <input style={{ padding: '8px', margin: '8px' }}
            type="text" placeholder="Username" name="username" />

          <input style={{ padding: '8px', margin: '8px' }}
            type="password" placeholder="Password" name="password" />

          <button type="submit" name="login">Login</button>
        </form>
      </div>
    </>
  )
}

export default App
