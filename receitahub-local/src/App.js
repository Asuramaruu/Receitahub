import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// --- FUNÇÕES DE "BANCO DE DADOS" (LocalStorage) ---

// Função para obter o banco de dados do localStorage
const getDatabase = () => {
  const db = localStorage.getItem('receitaHubDB');
  // Se não houver nada, inicializa uma estrutura padrão
  if (!db) {
    return { users: [], recipes: [], loggedInUser: null };
  }
  return JSON.parse(db);
};

// Função para salvar o estado atual do banco de dados no localStorage
const saveDatabase = (db) => {
  localStorage.setItem('receitaHubDB', JSON.stringify(db));
};

// --- COMPONENTES DA APLICAÇÃO ---

// Componente: Barra de Navegação
const Navbar = ({ currentUser, onLogout }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">ReceitaHub</Link>
      <div className="nav-links">
        {currentUser ? (
          <>
            <Link to="/nova-receita">Nova Receita</Link>
            <span className="nav-user">Olá, {currentUser.username}!</span>
            <button onClick={onLogout} className="nav-logout-btn">Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Componente: Página de Cadastro
const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const db = getDatabase();

    // Validações simples
    if (db.users.find(user => user.email === email)) {
      setError('Este e-mail já está em uso.');
      return;
    }
    if (db.users.find(user => user.username === username)) {
      setError('Este nome de usuário já está em uso.');
      return;
    }

    const newUser = { id: Date.now(), username, email, password };
    db.users.push(newUser);
    saveDatabase(db);

    alert('Cadastro realizado com sucesso! Faça o login.');
    navigate('/login');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Crie sua Conta</h2>
        {error && <p className="error-message">{error}</p>}
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

// Componente: Página de Login
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const db = getDatabase();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(user);
      navigate('/');
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

// Componente: Página de Formulário para Registrar Receita
const RecipeFormPage = ({ currentUser }) => {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(null); // State for the Base64 image string
    const navigate = useNavigate();

    // Handles the file input change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // When the file is read, the result is the Base64 string
                setImage(reader.result);
            };
            // This starts the reading process
            reader.readAsDataURL(file);
        } else {
            setImage(null);
        }
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addIngredientField = () => {
        setIngredients([...ingredients, '']);
    };
    
    const removeIngredientField = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !instructions || ingredients.some(ing => ing === '')) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const db = getDatabase();
        const newRecipe = {
            id: Date.now(),
            title,
            ingredients: ingredients.filter(ing => ing.trim() !== ''),
            instructions,
            authorId: currentUser.id,
            authorName: currentUser.username,
            createdAt: new Date().toLocaleDateString('pt-BR'),
            image: image, // Add the image (Base64 string or null) to the recipe object
        };
        db.recipes.push(newRecipe);
        saveDatabase(db);
        alert('Receita cadastrada com sucesso!');
        navigate('/');
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="recipe-form">
                <h2>Cadastre sua Receita</h2>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da Receita" required />
                
                {/* Seção de Upload de Imagem */}
                <div className="image-upload-section">
                    <label htmlFor="image-upload" className="image-upload-label">
                        Selecionar Imagem da Receita
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageChange}
                        style={{ display: 'none' }} // Hide the default input
                    />
                    {image && (
                        <div className="image-preview">
                            <img src={image} alt="Prévia da receita" />
                        </div>
                    )}
                </div>
                
                <div className="ingredients-section">
                    <h3>Ingredientes</h3>
                    {ingredients.map((ing, index) => (
                        <div key={index} className="ingredient-input">
                            <input
                                type="text"
                                value={ing}
                                onChange={(e) => handleIngredientChange(index, e.target.value)}
                                placeholder={`Ingrediente ${index + 1}`}
                            />
                            <button type="button" className="remove-btn" onClick={() => removeIngredientField(index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addIngredientField}>+ Adicionar Ingrediente</button>
                </div>

                <h3>Modo de Preparo</h3>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Descreva o passo a passo..." required />
                
                <button type="submit">Publicar Receita</button>
            </form>
        </div>
    );
};


// Componente: Página Principal (Home)
const HomePage = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    setRecipes(db.recipes.sort((a, b) => b.id - a.id));
  }, []);

  return (
    <div className="home-container">
      <h1>Receitas da Comunidade</h1>
      <div className="recipe-grid">
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <Link to={`/receita/${recipe.id}`} key={recipe.id} className="recipe-card">
              {/* Conditionally render the image if it exists */}
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="recipe-card-image" />
              ) : (
                <div className="recipe-card-image-placeholder">
                  <span>Sem Imagem</span>
                </div>
              )}
              <div className="recipe-card-content">
                <h3>{recipe.title}</h3>
                <p>por {recipe.authorName}</p>
                <span>{recipe.createdAt}</span>
              </div>
            </Link>
          ))
        ) : (
          <p>Ainda não há receitas cadastradas. Seja o primeiro!</p>
        )}
      </div>
    </div>
  );
};

// Componente: Página de Detalhe da Receita
const RecipeDetailPage = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        const db = getDatabase();
        const foundRecipe = db.recipes.find(r => r.id === parseInt(id));
        setRecipe(foundRecipe);
    }, [id]);

    if (!recipe) {
        return <div className="container"><h2>Receita não encontrada!</h2></div>;
    }

    return (
        <div className="container recipe-detail">
             {recipe.image && <img src={recipe.image} alt={recipe.title} className="recipe-detail-image" />}
            <h1>{recipe.title}</h1>
            <p className="author-info">Enviada por: <strong>{recipe.authorName}</strong> em {recipe.createdAt}</p>
            
            <div className="recipe-content">
                <div className="ingredients-list">
                    <h3>Ingredientes</h3>
                    <ul>
                        {recipe.ingredients.map((ing, index) => (
                            <li key={index}>{ing}</li>
                        ))}
                    </ul>
                </div>
                <div className="instructions">
                    <h3>Modo de Preparo</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (App) ---
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    if (db.loggedInUser) {
      const userExists = db.users.find(u => u.id === db.loggedInUser.id);
      if(userExists) {
        setCurrentUser(db.loggedInUser);
      } else {
        db.loggedInUser = null;
        saveDatabase(db);
      }
    }
  }, []);

  const handleLogin = (user) => {
    const db = getDatabase();
    db.loggedInUser = user;
    saveDatabase(db);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    const db = getDatabase();
    db.loggedInUser = null;
    saveDatabase(db);
    setCurrentUser(null);
    // Navigate to home after logout to prevent being on a protected page
    window.location.href = '/'; 
  };
  
  // Component to protect routes that require a logged-in user
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      return <LoginPage onLogin={handleLogin} />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/receita/:id" element={<RecipeDetailPage />} />
            <Route 
              path="/nova-receita" 
              element={
                <ProtectedRoute>
                  <RecipeFormPage currentUser={currentUser} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
