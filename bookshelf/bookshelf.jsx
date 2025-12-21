const { useState } = React;

const BookshelfApp = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  // Sample books - you can easily add more by copying this structure
  const books = [
    {
      id: 1,
      title: "Dune",
      author: "Frank Herbert",
      spine_color: "#D4A574",
      width: 45,
      height: 220,
      genre: "Science Fiction",
      rating: 5,
      dateRead: "2024-11-15",
      summary: "An epic tale of politics, religion, and ecology on the desert planet Arrakis. Paul Atreides must navigate betrayal and prophecy to become the leader his people needs.",
      thoughts: "Herbert's worldbuilding is unmatched. The ecological and political themes feel more relevant than ever. The spice must flow!",
      quotes: [
        "I must not fear. Fear is the mind-killer.",
        "Deep in the human unconscious is a pervasive need for a logical universe that makes sense."
      ],
      tags: ["Epic", "Political", "Desert", "Prophecy"],
      recommendTo: "Anyone who loves complex worldbuilding and political intrigue"
    },
    {
      id: 2,
      title: "The Design of Everyday Things",
      author: "Don Norman",
      spine_color: "#E8E8E8",
      width: 35,
      height: 230,
      genre: "Non-Fiction",
      rating: 4,
      dateRead: "2024-10-22",
      summary: "A foundational text on user experience design, exploring why some objects are intuitive while others are frustrating.",
      thoughts: "Changed how I look at every door handle and light switch. Norman's principles are timeless, though some examples feel dated.",
      quotes: [
        "Good design is actually a lot harder to notice than poor design.",
        "The design of the door should indicate how to work it without any need for signs."
      ],
      tags: ["Design", "UX", "Psychology"],
      recommendTo: "Designers, engineers, and anyone curious about why things work the way they do"
    },
    {
      id: 3,
      title: "Pachinko",
      author: "Min Jin Lee",
      spine_color: "#C84848",
      width: 38,
      height: 215,
      genre: "Historical Fiction",
      rating: 5,
      dateRead: "2024-09-08",
      summary: "A multigenerational saga following a Korean family living in Japan from the early 1900s through the 1980s.",
      thoughts: "Heartbreaking and beautiful. Lee captures the immigrant experience with such empathy and nuance. I couldn't put it down.",
      quotes: [
        "History has failed us, but no matter.",
        "Living every day in the presence of those who refuse to acknowledge your humanity takes great courage."
      ],
      tags: ["Family Saga", "Korea", "Japan", "Immigration"],
      recommendTo: "Anyone who loves character-driven historical fiction"
    },
    {
      id: 4,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      spine_color: "#4A90E2",
      width: 40,
      height: 235,
      genre: "Non-Fiction",
      rating: 4,
      dateRead: "2024-08-14",
      summary: "Nobel Prize winner Kahneman explores the two systems that drive our thinking: the fast, intuitive System 1 and the slow, deliberate System 2.",
      thoughts: "Dense but rewarding. Makes you question every decision you make. Some parts drag, but the insights are invaluable.",
      quotes: [
        "Nothing in life is as important as you think it is while you are thinking about it.",
        "We can be blind to the obvious, and we are also blind to our blindness."
      ],
      tags: ["Psychology", "Behavioral Economics", "Decision Making"],
      recommendTo: "Anyone interested in psychology, economics, or why humans are so predictably irrational"
    },
    {
      id: 5,
      title: "The Three-Body Problem",
      author: "Liu Cixin",
      spine_color: "#2C3E50",
      width: 42,
      height: 225,
      genre: "Science Fiction",
      rating: 5,
      dateRead: "2024-12-01",
      summary: "China's Cultural Revolution sets the stage for humanity's first contact with an alien civilization facing extinction.",
      thoughts: "Mind-bending hard sci-fi that tackles the Fermi Paradox in the most creative way I've seen. The physics lectures are worth it for the payoff.",
      quotes: [
        "In the shooter hypothesis, a good marksman shoots at a target, and the target is hit. In the farmer hypothesis, a farmer feeds chickens in a coop and those chickens are selected to live.",
        "To effectively contain a civilization's development and disarm it across such a long span of time, there is only one way: kill its science."
      ],
      tags: ["Hard Sci-Fi", "First Contact", "Physics", "China"],
      recommendTo: "Hard sci-fi fans who don't mind math and want their minds blown"
    },
    {
      id: 6,
      title: "Educated",
      author: "Tara Westover",
      spine_color: "#8B7355",
      width: 36,
      height: 210,
      genre: "Memoir",
      rating: 5,
      dateRead: "2024-07-20",
      summary: "A memoir about growing up in a survivalist family in Idaho and eventually earning a PhD from Cambridge despite never attending school as a child.",
      thoughts: "Absolutely gripping. Westover's journey from isolation to education is both inspiring and heartbreaking. A testament to resilience.",
      quotes: [
        "You can love someone and still choose to say goodbye to them.",
        "Everything I had worked for, all my years of study, had been to purchase for myself this one privilege: to see and experience more truths than those given to me by my father."
      ],
      tags: ["Memoir", "Education", "Family", "Resilience"],
      recommendTo: "Everyone - it's a powerful story about the transformative power of education"
    }
  ];

  const genres = ['all', ...new Set(books.map(b => b.genre))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  // Split books into shelves of 12
  const shelves = [];
  for (let i = 0; i < filteredBooks.length; i += 12) {
    shelves.push(filteredBooks.slice(i, i + 12));
  }

  const BookSpine = ({ book }) => (
    React.createElement('div', {
      onClick: () => setSelectedBook(book),
      className: "relative cursor-pointer hover:translate-y-[-8px] transition-all duration-300 hover:shadow-2xl group",
      style: {
        width: `${book.width}px`,
        height: `${book.height}px`,
        backgroundColor: book.spine_color,
        borderRadius: '0 0 3px 3px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.2)',
        borderTop: '3px solid rgba(0,0,0,0.3)',
        padding: '12px 6px',
      }
    },
      React.createElement('div', { className: "h-full flex flex-col justify-between items-center" },
        React.createElement('div', {
          className: "font-serif font-bold text-xs text-center leading-tight",
          style: {
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: book.spine_color === '#E8E8E8' ? '#333' : '#fff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }
        }, book.title),
        React.createElement('div', {
          className: "font-serif text-xs text-center mt-2",
          style: {
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: book.spine_color === '#E8E8E8' ? '#666' : 'rgba(255,255,255,0.8)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }
        }, book.author)
      ),
      React.createElement('div', {
        className: "absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded",
        style: { pointerEvents: 'none' }
      })
    )
  );

  const BookModal = ({ book, onClose }) => (
    React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4",
      onClick: onClose
    },
      React.createElement('div', {
        className: "bg-amber-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl",
        onClick: e => e.stopPropagation()
      },
        React.createElement('div', {
          className: "sticky top-0 bg-amber-100 border-b-2 border-amber-900 p-6 flex justify-between items-start"
        },
          React.createElement('div', { className: "flex-1" },
            React.createElement('h2', { className: "text-3xl font-serif font-bold text-amber-900 mb-1" }, book.title),
            React.createElement('p', { className: "text-lg text-amber-700 italic" }, `by ${book.author}`),
            React.createElement('div', { className: "flex items-center gap-4 mt-3 flex-wrap" },
              React.createElement('div', { className: "flex items-center gap-1" },
                [...Array(5)].map((_, i) =>
                  React.createElement('span', {
                    key: i,
                    className: i < book.rating ? 'text-amber-500' : 'text-amber-300',
                    style: { fontSize: '18px' }
                  }, '★')
                )
              ),
              React.createElement('div', { className: "flex items-center gap-1 text-sm text-amber-700" },
                '📅 ',
                new Date(book.dateRead).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              ),
              React.createElement('span', {
                className: "px-2 py-1 bg-amber-200 text-amber-800 rounded text-sm font-medium"
              }, book.genre)
            )
          ),
          React.createElement('button', {
            onClick: onClose,
            className: "ml-4 text-amber-700 hover:text-amber-900 transition-colors text-2xl"
          }, '×')
        ),
        React.createElement('div', { className: "p-6 space-y-6" },
          React.createElement('div', {},
            React.createElement('h3', { className: "text-xl font-serif font-bold text-amber-900 mb-2" }, 'Summary'),
            React.createElement('p', { className: "text-amber-900 leading-relaxed" }, book.summary)
          ),
          React.createElement('div', {},
            React.createElement('h3', { className: "text-xl font-serif font-bold text-amber-900 mb-2" }, 'My Thoughts'),
            React.createElement('p', { className: "text-amber-900 leading-relaxed" }, book.thoughts)
          ),
          book.quotes && book.quotes.length > 0 && React.createElement('div', {},
            React.createElement('h3', { className: "text-xl font-serif font-bold text-amber-900 mb-2" }, 'Favorite Quotes'),
            React.createElement('div', { className: "space-y-3" },
              book.quotes.map((quote, idx) =>
                React.createElement('blockquote', {
                  key: idx,
                  className: "border-l-4 border-amber-400 pl-4 italic text-amber-800"
                }, `"${quote}"`)
              )
            )
          ),
          book.tags && book.tags.length > 0 && React.createElement('div', {},
            React.createElement('h3', { className: "text-xl font-serif font-bold text-amber-900 mb-2" }, '🏷️ Tags'),
            React.createElement('div', { className: "flex flex-wrap gap-2" },
              book.tags.map((tag, idx) =>
                React.createElement('span', {
                  key: idx,
                  className: "px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm"
                }, tag)
              )
            )
          ),
          book.recommendTo && React.createElement('div', {},
            React.createElement('h3', { className: "text-xl font-serif font-bold text-amber-900 mb-2" }, 'I\'d Recommend This To'),
            React.createElement('p', { className: "text-amber-900 leading-relaxed" }, book.recommendTo)
          )
        )
      )
    )
  );

  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-b from-amber-100 to-amber-200 p-8" },
      React.createElement('div', { className: "max-w-6xl mx-auto" },
        React.createElement('div', { className: "text-center mb-16 mt-8" },
          React.createElement('h1', { className: "text-5xl font-serif font-bold text-amber-900 mb-2" }, 'My Bookshelf'),
          React.createElement('p', { className: "text-amber-700 text-lg" }, 'Click any book to read my report')
        ),
        React.createElement('div', { className: "bg-white rounded-lg shadow-lg p-6 mb-8" },
          React.createElement('div', { className: "flex flex-col sm:flex-row gap-4" },
            React.createElement('div', { className: "flex-1 relative" },
              React.createElement('span', {
                className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
              }, '🔍'),
              React.createElement('input', {
                type: "text",
                placeholder: "Search by title or author...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full pl-10 pr-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
              })
            ),
            React.createElement('select', {
              value: filterGenre,
              onChange: (e) => setFilterGenre(e.target.value),
              className: "px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
            },
              genres.map(genre =>
                React.createElement('option', { key: genre, value: genre },
                  genre === 'all' ? 'All Genres' : genre
                )
              )
            )
          )
        ),
        React.createElement('div', { className: "space-y-8" },
          shelves.length > 0 ? (
            shelves.map((shelf, shelfIndex) =>
              React.createElement('div', {
                key: shelfIndex,
                className: "bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl p-8",
                style: {
                  backgroundImage: 'linear-gradient(to bottom, #78350f, #451a03)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3)'
                }
              },
                React.createElement('div', {
                  className: "flex flex-wrap items-end justify-center gap-1 min-h-[250px]"
                },
                  shelf.map((book) =>
                    React.createElement(BookSpine, { key: book.id, book: book })
                  )
                )
              )
            )
          ) : (
            React.createElement('div', {
              className: "bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl p-8",
              style: {
                backgroundImage: 'linear-gradient(to bottom, #78350f, #451a03)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3)'
              }
            },
              React.createElement('div', {
                className: "flex items-center justify-center min-h-[250px]"
              },
                React.createElement('p', { className: "text-amber-200 text-lg" }, 'No books found matching your search.')
              )
            )
          )
        ),
        React.createElement('div', { className: "mt-6 text-center text-amber-700 text-sm" },
          `${filteredBooks.length} book${filteredBooks.length !== 1 ? 's' : ''} on ${shelves.length} shelf${shelves.length !== 1 ? 'ves' : ''}`
        )
      ),
      selectedBook && React.createElement(BookModal, { book: selectedBook, onClose: () => setSelectedBook(null) })
    )
  );
};

ReactDOM.render(React.createElement(BookshelfApp), document.getElementById('root'));
