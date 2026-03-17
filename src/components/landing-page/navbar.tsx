import { Button } from '../ui/button';

function Navbar() {

	return (
		<div className='flex justify-center w-full'>
			<div className='flex justify-between p-4 w-full md:max-w-5/6'>
				<div className='flex gap-2 items-center justify-center'>
                    <img src='/images/generic_logo.png' className='w-8'/>
					<p className='text-xl font-bold'>{import.meta.env.VITE_APP_NAME}</p>
				</div>
				<nav>

				</nav>
				<div className='flex gap-2'>
					<Button variant={'outline'}>Login</Button>
					<Button variant={'default'}>Register</Button>
				</div>
			</div>
		</div>
	);
}

export default Navbar;