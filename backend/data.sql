
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
  (1, 1),
  (2, 2),
  (3, 2),
  (4, 3),
  (5, 4), 
  (6, 5); 

-- GENRES
INSERT INTO Genres (genre_id, genre_name) VALUES
  (1, 'Fantasy'),
  (2, 'Dystopian'),
  (3, 'Adventure'),
  (4, 'Classic'),
  (5, 'Historical Fiction');

-- BOOK↔GENRES
INSERT INTO BookGenres (book_id, genre_id) VALUES
  (1, 1),
  (2, 2),
  (3, 2),
  (3, 4),
  (4, 1),
  (4, 3),
  (5, 4),
  (5, 5),
  (6, 4),
  (6, 5);