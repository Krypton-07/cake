import { useState } from 'react';
import Styles from './add.module.css';
import { UseContext } from '../../contexts/context';

const AddCard = () => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [image, setImage] = useState(null);

	const { addCard } = UseContext();

	const handleSubmit = async e => {
		try {
			e.preventDefault();
			const formData = new FormData();
			formData.append('name', name);
			formData.append('description', description);
			formData.append('price', price);
			formData.append('image', image);

			await addCard(formData);
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<main className={Styles.mainContent}>
			<div className={Styles.addpageContent}>
				<h1>Add Your Sweet Treat</h1>
				<p>
					Fill in the details of your delicious creation below{' '}
					<b>:</b>
				</p>

				<form className={Styles.addpageForm} onSubmit={handleSubmit}>
					<div className={Styles.addpageFormGroup}>
						<label htmlFor="name" className={Styles.addpageLabel}>
							Name :
						</label>
						<input
							type="text"
							id="name"
							className={Styles.addpageInput}
							value={name}
							onChange={e => setName(e.target.value)}
							required
							placeholder="Enter the sweet's name"
						/>
					</div>

					<div className={Styles.addpageFormGroup}>
						<label
							htmlFor="description"
							className={Styles.addpageLabel}
						>
							Description :
						</label>
						<textarea
							id="description"
							className={Styles.addpageTextarea}
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder="Describe the flavor, ingredients, etc."
						/>
					</div>

					<div className={Styles.addpageFormGroup}>
						<label htmlFor="price" className={Styles.addpageLabel}>
							Price :
						</label>
						<input
							type="number"
							id="price"
							className={Styles.addpageInput}
							value={price}
							onChange={e => setPrice(e.target.value)}
							required
							min="1"
							placeholder="e.g., 500 BDT"
						/>
					</div>

					<div className={Styles.addpageFormGroup}>
						<label htmlFor="image" className={Styles.addpageLabel}>
							Upload Image :
						</label>
						<input
							type="file"
							id="image"
							className={Styles.addpageInput}
							onChange={e => setImage(e.target.files[0])}
							accept="image/*"
						/>
					</div>

					<button type="submit" className={Styles.submitButton}>
						Add Sweet
					</button>
				</form>
			</div>
		</main>
	);
};

export default AddCard;
