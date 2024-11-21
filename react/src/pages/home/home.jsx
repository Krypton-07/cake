import Style from './home.module.css';
import cakeImage from '../../assets/cake.jpg';
import { UseContext } from '../../contexts/context';
import Card from '../../components/card/card';

const Home = () => {
	const { cardsData } = UseContext();

	return (
		<main>
			<img src={cakeImage} className={Style.img} alt="Cake" />
			<section className={Style.cardsArea}>
				<hr className={Style.hr} />
				<div className={Style.cards}>
					{cardsData?.map((e, index) => (
						<Card
							key={index}
							img={e.imageUrl}
							name={e.name}
							price={e.price.toString()}
							id={e._id}
						/>
					))}
				</div>
				<hr className={Style.hr} />
			</section>
		</main>
	);
};

export default Home;
