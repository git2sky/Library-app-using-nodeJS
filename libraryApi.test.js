const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Library API', () => {
    beforeEach(() => {
        // Clear books array before each test
        app.books = [];
    });

    describe('POST /books', () => {
        it('should add a new book', async () => {
            const res = await chai.request(app)
                .post('/books')
                .send({ book: 'Book Title' });
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('message', 'Book added successfully.');
        });

        it('should return 400 if book title is missing', async () => {
            const res = await chai.request(app)
                .post('/books')
                .send({});
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });

        it('should return 400 if book already exists', async () => {
            app.books = ['Existing Book'];
            const res = await chai.request(app)
                .post('/books')
                .send({ book: 'Existing Book' });
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });
    });

    describe('DELETE /books', () => {
        beforeEach(() => {
            app.books = ['Book 1', 'Book 2', 'Book 3'];
        });

        it('should remove a book', async () => {
            const res = await chai.request(app)
                .delete('/books')
                .send({ book: 'Book 1' });
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('message', 'Book removed successfully.');
            expect(app.books).to.not.include('Book 1');
        });

        it('should return 404 if book does not exist', async () => {
            const res = await chai.request(app)
                .delete('/books')
                .send({ book: 'Nonexistent Book' });
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('error');
        });
    });

    describe('PATCH /books', () => {
        beforeEach(() => {
            app.books = ['Book 1', 'Book 2', 'Book 3'];
        });

        it('should update a book name', async () => {
            const res = await chai.request(app)
                .patch('/books')
                .send({ original_book: 'Book 1', new_book: 'Updated Book' });
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('message', 'Book name updated successfully.');
            expect(app.books).to.include('Updated Book');
            expect(app.books).to.not.include('Book 1');
        });

        it('should return 400 if original book does not exist', async () => {
            const res = await chai.request(app)
                .patch('/books')
                .send({ original_book: 'Nonexistent Book', new_book: 'Updated Book' });
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });

        it('should return 400 if new book name already exists', async () => {
            const res = await chai.request(app)
                .patch('/books')
                .send({ original_book: 'Book 1', new_book: 'Book 2' });
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });
    });

    describe('GET /books', () => {
        beforeEach(() => {
            app.books = ['Book 1', 'Book 2', 'Book 3'];
        });

        it('should return the full contents of the library', async () => {
            const res = await chai.request(app)
                .get('/books');
            expect(res).to.have.status(200);
            expect(res.text).to.equal('Book 1; Book 2; Book 3');
        });
    });

    describe('PUT /books', () => {
        beforeEach(() => {
            app.books = ['Book 1', 'Book 2', 'Book 3'];
        });

        it('should simulate asynchronous persistence', async () => {
            const res = await chai.request(app)
                .put('/books');
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(Object.keys(res.body).length).to.equal(3); // Number of books
            for (const book in res.body) {
                expect(res.body[book]).to.be.a('number');
            }
        });
    });
});
