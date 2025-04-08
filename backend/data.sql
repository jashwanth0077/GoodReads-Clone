
INSERT INTO Authors (author_id, name) VALUES
  (1, 'J.K. Rowling'),
  (2, 'George Orwell'),
  (3, 'J.R.R. Tolkien'),
  (4, 'Harper Lee'),
  (5, 'F. Scott Fitzgerald');

-- BOOKS
INSERT INTO Books (book_id, title, publication_year, isbn) VALUES
  (1, 'Harry Potter and the Philosopher''s Stone', 1997, '9780747532699'),
  (2, '1984',                         1949, '9780451524935'),
  (3, 'Animal Farm',                  1945, '9780451526342'),
  (4, 'The Hobbit',                   1937, '9780618968633'),
  (5, 'To Kill a Mockingbird',        1960, '9780061120084'),
  (6, 'The Great Gatsby',             1925, '9780743273565');

-- BOOK↔AUTHORS
INSERT INTO BookAuthors (book_id, author_id) VALUES
  (1, 1),  -- Harry Potter → J.K. Rowling
  (2, 2),  -- 1984 → George Orwell
  (3, 2),  -- Animal Farm → George Orwell
  (4, 3),  -- The Hobbit → J.R.R. Tolkien
  (5, 4),  -- To Kill a Mockingbird → Harper Lee
  (6, 5);  -- The Great Gatsby → F. Scott Fitzgerald

-- GENRES
INSERT INTO Genres (genre_id, genre_name) VALUES
  (1, 'Fantasy'),
  (2, 'Dystopian'),
  (3, 'Adventure'),
  (4, 'Classic'),
  (5, 'Historical Fiction');

-- BOOK↔GENRES
INSERT INTO BookGenres (book_id, genre_id) VALUES
  (1, 1),  -- Harry Potter → Fantasy
  (2, 2),  -- 1984 → Dystopian
  (3, 2),  -- Animal Farm → Dystopian
  (3, 4),  -- Animal Farm → Classic
  (4, 1),  -- The Hobbit → Fantasy
  (4, 3),  -- The Hobbit → Adventure
  (5, 4),  -- To Kill a Mockingbird → Classic
  (5, 5),  -- To Kill a Mockingbird → Historical Fiction
  (6, 4),  -- The Great Gatsby → Classic
  (6, 5);  -- The Great Gatsby → Historical Fiction