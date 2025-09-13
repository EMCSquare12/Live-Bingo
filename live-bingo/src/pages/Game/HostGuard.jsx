import Host from "./Host.jsx";

const HostGuard = () => {
  // Authorization is now handled by the parent Game.jsx component.
  // This component's only job is to render the Host page.
  return <Host />;
};

export default HostGuard;