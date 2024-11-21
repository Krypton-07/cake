/* eslint-disable react-hooks/exhaustive-deps */
import Style from './cart.module.css';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/card/card';
import { UseContext } from '../../contexts/context';

const Cart = () => {
	const { id } = useParams();
	const { getCart, cartCards, cardsData } = UseContext();

	useEffect(() => {
		if (id && cardsData.length > 0) {
			getCart(id);
		}
	}, [id, cardsData]);

	return (
		<main>
			<section className={Style.cardsArea}>
				<hr className={Style.hr} />
				<div className={Style.cards}>
					{cartCards?.map(e => (
						<Card
							key={e._id}
							img={e.imageUrl}
							name={e.name}
							price={e.price}
							id={e._id}
						/>
					))}
				</div>

				<hr className={Style.hr} />
			</section>
		</main>
	);
};

export default Cart;
