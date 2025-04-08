INSERT INTO Authors (name) VALUES
('J.K. Rowling'),
('George Orwell'),
('J.R.R. Tolkien'),
('Harper Lee'),
('F. Scott Fitzgerald');

-- Insert sample books
INSERT INTO Books (title, publication_year, isbn) VALUES
('Harry Potter and the Philosopher''s Stone', 1997, '9780747532699'),
('1984', 1949, '9780451524935'),
('Animal Farm', 1945, '9780451526342'),
('The Hobbit', 1937, '9780618968633'),
('To Kill a Mockingbird', 1960, '9780061120084'),
('The Great Gatsby', 1925, '9780743273565');

-- Establish relationships between books and authors
-- Assuming book_id and author_id are auto-generated sequentially starting from 1
INSERT INTO BookAuthors (book_id, author_id) VALUES
(1, 1), -- 'Harry Potter and the Philosopher''s Stone' by 'J.K. Rowling'
(2, 2), -- '1984' by 'George Orwell'
(3, 2), -- 'Animal Farm' by 'George Orwell'
(4, 3), -- 'The Hobbit' by 'J.R.R. Tolkien'
(5, 4), -- 'To Kill a Mockingbird' by 'Harper Lee'
(6, 5); -- 'The Great Gatsby' by 'F. Scott Fitzgerald'INSERT INTO Products (product_id, name, price, stock_quantity) VALUES

INSERT INTO Genres (genre_name) VALUES
('Fantasy'),
('Dystopian'),
('Adventure'),
('Classic'),
('Historical Fiction');

-- Establish relationships between books and genres
-- Assuming book_id and genre_id are assigned sequentially starting from 1
INSERT INTO BookGenres (book_id, genre_id) VALUES
(1, 1), -- 'Harry Potter and the Philosopher''s Stone' is Fantasy
(2, 2), -- '1984' is Dystopian
(3, 2), -- 'Animal Farm' is Dystopian
(4, 1), -- 'The Hobbit' is Fantasy
(4, 3), -- 'The Hobbit' is also an Adventure
(5, 4), -- 'To Kill a Mockingbird' is a Classic
(6, 4); -- 'The Great Gatsby' is a Classic
