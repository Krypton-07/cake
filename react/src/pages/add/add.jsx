import { useRef, useState } from 'react';
import Styles from './add.module.css';
import { UseContext } from '../../contexts/context';

const AddCard = () => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [dragging, setDragging] = useState(false);

	const { addCard } = UseContext();
	const imgUpload = useRef();

	const handleImageChange = e => {
		const file = e.target.files[0];
		handleFile(file);
	};

	const handleFile = file => {
		setImage(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const handleDragOver = e => {
		e.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = () => {
		setDragging(false);
	};

	const handleDrop = e => {
		e.preventDefault();
		setDragging(false);
		const file = e.dataTransfer.files[0];
		handleFile(file);
	};

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
						<label className={Styles.addpageLabel}>
							Upload Image :
						</label>
						<div
							className={`${Styles.uploadDropArea} ${
								dragging ? Styles.dragging : ''
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => {
								imgUpload.current.click();
							}}
						>
							<span>Drag & Drop or Click to Upload Image</span>
							{imagePreview && (
								<img
									src={imagePreview}
									alt="Preview"
									className={Styles.imagePreview}
								/>
							)}
							<input
								type="file"
								id="image"
								className={Styles.hiddenFileInput}
								onChange={handleImageChange}
								accept="image/*"
								ref={imgUpload}
							/>
						</div>
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
