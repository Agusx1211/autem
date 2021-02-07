import Transition from 'react-transition-group/Transition';

const duration = 300;

const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
}

const transitionStyles = {
    entering: { opacity: 0, display: 'none' },
    entered:  { opacity: 1 , display: 'block'},
    exited:  { opacity: 0, display: 'none'},
};

const Fade = ({ in: inProp }) => (
    <Transition in={inProp} timeout={duration}>
        {(state) => (
        <div style={{
            ...defaultStyle,
            ...transitionStyles[state]
        }}>
            I'm a fade Transition!
        </div>
        )}
    </Transition>
)
