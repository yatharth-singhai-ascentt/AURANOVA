import qrcode
from flask import Flask, render_template, request, flash, redirect, url_for
from pymongo import MongoClient
from config import MONGODB_CONFIG
from urllib.parse import quote_plus

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for using flash messages

# Properly escape the username and password for MongoDB URI
username = quote_plus(MONGODB_CONFIG['username'])
password = quote_plus(MONGODB_CONFIG['password'])
cluster_url = MONGODB_CONFIG['cluster_url']
database_name = MONGODB_CONFIG['database']

# Create the MongoDB client
client = MongoClient(f"mongodb+srv://{username}:{password}@{cluster_url}/{database_name}?retryWrites=true&w=majority")
db = client[database_name]
cars_collection = db['CARS']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')

        if name and email and subject and message:
            flash('Thank you for your message! We will get back to you soon.', 'success')
            return redirect(url_for('contact'))
        else:
            flash('Please fill in all fields.', 'error')

    return render_template('contact.html')

@app.route('/car_details', methods=['POST'])
def car_details():
    try:
        brand = request.form.get('brand', '').strip()
        model = request.form.get('model', '').strip()
        year = request.form.get('year', '').strip()

        # Basic validation
        if not all([brand, model, year]):
            return render_template('car_details.html', error_message='No car details found.', car=None)

        try:
            year = int(year)
        except ValueError:
            return render_template('car_details.html', error_message='No car details found.', car=None)

        # Query the MongoDB collection for the specific car
        car = cars_collection.find_one({
            'Brand': brand,
            'Model': model,
            'Year': year
        })

        if car:
            return render_template('car_details.html', car=car, error_message=None)
        else:
            return render_template('car_details.html', error_message='No car details found.', car=None)

    except Exception as e:
        # Log the error if needed
        return render_template('car_details.html', error_message='No car details found.', car=None)

@app.route('/edit_car/<brand>/<model>/<int:year>')
def edit_car(brand, model, year):
    car = cars_collection.find_one({
        'Brand': brand,
        'Model': model,
        'Year': year
    })

    if car:
        return render_template('edit_car.html', car=car)
    else:
        flash('Car not found', 'error')
        return redirect(url_for('home'))

@app.route('/model')
def model():
    return render_template('model.html')

@app.route('/ar-view')
def ar_view():
    return render_template('ar_view.html')

@app.route('/generate_qr')
def generate_qr():
    # Define the URL to the AR viewer page
    ar_viewer_url = "http://192.168.29.189:5000/ar-view"  # Replace with your server's IP and page

    # Create a QR Code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    # Add the URL data
    qr.add_data(ar_viewer_url)
    qr.make(fit=True)

    # Generate and save the QR code as an image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    qr_image.save("static/ar_viewer_qr.png")

    print(f"QR Code successfully generated for {ar_viewer_url} and saved as 'static/ar_viewer_qr.png'.")

    return render_template('qr_code.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
