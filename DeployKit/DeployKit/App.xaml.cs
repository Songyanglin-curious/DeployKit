using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Windows;

namespace DeployKit;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        Debug.WriteLine("1.OnStartup被触发");
    }

    protected override void OnActivated(EventArgs e)
    {
        base.OnActivated(e);
        Debug.WriteLine("2.OnActivated被触发");
    }

    protected override void OnDeactivated(EventArgs e)
    {
        base.OnDeactivated(e);
        Debug.WriteLine("3.OnDeactivated被触发");
    }

    protected override void OnExit(ExitEventArgs e)
    {
        base.OnExit(e);
        Debug.WriteLine("4.OnExit被触发");
    }
}

